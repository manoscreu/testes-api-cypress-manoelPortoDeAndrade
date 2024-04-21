import { faker } from "@faker-js/faker";
import { LoremIpsum } from "lorem-ipsum";



describe("Testes de Cadastro de filme sem usuario conectado", function () {
    before(function () {
        cy.fixture("requests/cadastroFilme").as("filmeTeste")
    });
    it("Tenta fazer o cadastro de um filme sem logar em um usuario", function () {
        cy.fixture("users/responses/erroUserNaoAutorizado").then(function (erro) {
            cy.request({
                method: "POST",
                url: "/movies",
                body: this.filmeTeste,
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(401);
                expect(response.body).to.deep.equal(erro);
            });
        });
    });
});

describe("Testes de Cadastro de filme com usuario comum", function () {
    let criaEmail = faker.internet.email()
    let criaNome = faker.internet.userName()
    before(function () {
        cy.request("POST", "/users", {
            name: criaNome,
            email: criaEmail,
            password: "123456"
        });
        cy.fixture("users/responses/erroUserNaoAutorizado").as("erroNaoAutorizado")
    });
    //desativa o usuario criado
    afterEach(function () {
        cy.inativaUser(criaEmail)
    });
    it("Login usuario comum e tenta cadastrar um filme", function () {
        cy.fixture("requests/cadastroFilme").then(function (filme) {
            cy.request({
                method: "POST",
                url: "/auth/login",
                body: {
                    email: criaEmail,
                    password: "123456"
                }
            })
            cy.request({
                method: "POST",
                url: "/movies",
                body: filme,
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.equal(401)
                expect(response.body).to.deep.equal(this.erroNaoAutorizado)
            })
        });
    });
});

describe("Testes de Cadastro de filme com usuario administrador", function () {
    const lorem = new LoremIpsum({
        wordsPerSentence: {
            max: 10,
            min: 3
        }
    });
    let uId;
    let userToken;
    let tamanhoArray;
    let filme;
    before(function () {
        cy.criaELoga().then(function (userData) {
            uId = userData.userId
            userToken = userData.uToken
        })
    })
    after(function () {
        cy.deletaUser(uId, userToken)
    })
    it("Faz o cadastro de um filme", function () {
        cy.request({
            method: "POST",
            url: "/movies",
            body: {
                title: lorem.generateSentences(1),
                genre: "Ficção científica/Aventura",
                description: lorem.generateSentences(1),
                durationInMinutes: 151,
                releaseYear: 2015
            },
            headers: {
                Authorization: 'Bearer ' + userToken
            }
        }).then(function (response) {
            filme = response.body
            expect(response.status).to.equal(201)
            cy.log(filme)
        })
        cy.request({
            method: "GET",
            url: "/movies"
        }).then(function (response) {
            tamanhoArray = response.body.length - 1
            expect(response.status).to.equal(200)
            expect(response.body).to.be.an("array")
            expect(response.body[tamanhoArray].id).to.be.an("number")
            expect(response.body[tamanhoArray].title).to.be.an("string")
            expect(response.body[tamanhoArray].genre).to.deep.equal("Ficção científica/Aventura")
            expect(response.body[tamanhoArray].description).to.be.an("string")
            expect(response.body[tamanhoArray].durationInMinutes).to.equal(151)
            expect(response.body[tamanhoArray].releaseYear).to.equal(2015)
        });
    });
});

describe("Testes de busca de filmes", function () {
    let tamanhoArray
    it("Lista todos os filmes sem ordem de avaliaçoes e verifica o primeiro criado e o ultimo criado", function () {
        cy.request({
            method: "GET",
            url: "/movies",
            sort: false
        }).then(function (response) {
            expect(response.body).to.be.an("array")
            tamanhoArray = response.body.length - 1
            cy.log(response.body[0])
            cy.log(response.body[tamanhoArray])
        })
    })
    it("Lista todos os filmes por ordem de avaliação e verifica os com maior e menor avaliação ", function () {
        cy.request({
            method: "GET",
            url: "/movies",
            sort: true
        }).then(function (response) {
            expect(response.body).to.be.an("array")
            tamanhoArray = response.body.length - 1
            cy.log(response.body)
            cy.log(response.body[0])
            cy.log(response.body[tamanhoArray])
        })
    })
    it("Verifica o ultimo filme cadastrado ", function () {
        cy.request({
            method: "GET",
            url: "/movies",
            sort: false
        }).then(function (response) {
            expect(response.body).to.be.an("array")
            tamanhoArray = response.body.length - 1
            expect(response.body[tamanhoArray].id).to.be.an("number")
            expect(response.body[tamanhoArray].title).to.be.an("string")
            expect(response.body[tamanhoArray].genre).to.be.an("string")
            expect(response.body[tamanhoArray].description).to.be.an("string")
            expect(response.body[tamanhoArray].durationInMinutes).to.be.an("number")
            expect(response.body[tamanhoArray].releaseYear).to.be.an("number")

        })
    })
})

describe.only("Testes de atualização de filmes", function () {
    let uId;
    let userToken;
    let titulo;
    let descricao;
    let tamanhoArray;
    let idFilme;
    before(function () {
        cy.criaELoga().then(function (userData) {
            uId = userData.userId
            userToken = userData.uToken
        }).then(function () {
            cy.criaFilme(userToken).then(function (filmeData) {
                titulo = filmeData.titulo
                descricao = filmeData.descricao
            }).then(function () {
                cy.log(titulo)
                cy.log(descricao)
            })
        })
    })
    after(function () {
        cy.deletaUser(uId, userToken)
    })
    it("Testa a alteração do cadastro de um filme", function () {
        cy.request({
            method: "GET",
            url: "/movies",
            sort: false
        }).then(function (response) {
            expect(response.status).to.eq(200)
            tamanhoArray = response.body.length - 1
            idFilme = response.body[tamanhoArray].id
            if (response.body[tamanhoArray].title === titulo) {
                cy.request({
                    method: "PUT",
                    url: "movies/" + idFilme,
                    body: {
                        "title": "Perdido em Marte",
                        "genre": "Ficção científica/Aventura",
                        "description": "Matt Damon se encontra em mais uma enrascada e precisa ser salvo, só que dessa vez é fora da terra",
                        "durationInMinutes": 151,
                        "releaseYear": 2015
                    },
                    headers: {
                        Authorization: 'Bearer ' + userToken
                    }
                }).then(function(response){
                    expect(response.status).to.equal(204)
                })
                    .then(function () {
                        cy.fixture("requests/cadastroFilme").then(function (filme) {
                            cy.request({
                                method: "GET",
                                url: "/movies/" + idFilme,
                            }).then(function (response) {
                                expect(response.status).to.eq(200)
                                expect(response.body).to.deep.include(filme)
                            })
                        })
                    })
            }
        })
    })
})
