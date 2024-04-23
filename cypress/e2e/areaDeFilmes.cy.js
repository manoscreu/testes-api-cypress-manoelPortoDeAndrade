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
        cy.logaEInativaUser(criaEmail)
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

describe.only("Testes de Cadastro de filme com usuario critico", function () {
    let criaEmail = faker.internet.email();
    let criaNome = faker.internet.userName();
    let token;
    before(function () {
        cy.request("POST", "/users", {
            name: criaNome,
            email: criaEmail,
            password: "123456"
        })
        cy.fixture("users/responses/erroUserNaoAutorizado").as("erroNaoAutorizado")
    });
    //desativa o usuario criado
    after(function () {
        cy.inativaUser(token)
    });
    it("Faz o login com um usuario critico e tenta cadastrar um filme", function () {
        cy.fixture("requests/cadastroFilme").then(function (filme) {
            cy.request({
                method: "POST",
                url: "/auth/login",
                body: {
                    email: criaEmail,
                    password: "123456"
                }
            }).then(function (response) {
                token = response.body.accessToken
                cy.request({
                    method: "PATCH",
                    url: "/users/apply",
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                })
            }).then(function () {
                cy.request({
                    method: "POST",
                    url: "/movies",
                    body: filme,
                    failOnStatusCode: false
                }).then(function (response) {
                    expect(response.status).to.equal(401)
                    expect(response.body).to.deep.equal(this.erroNaoAutorizado)
                })
            })

        });
    });
});

describe("Testes de Cadastro de filme com usuario administrador, testes de bad request", function () {
    let uId;
    let userToken;
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
    it("Teste de cadastro de filme sem titulo", function () {
        cy.request({
            method: "POST",
            url: "/movies",
            body: {
                title: "",
                genre: "Ficção científica/Aventura",
                description: "Matt Damon se encontra em mais uma enrascada e precisa ser salvo, só que dessa vez é fora da terra",
                durationInMinutes: 151,
                releaseYear: 2015
            },
            headers: {
                Authorization: 'Bearer ' + userToken
            },
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.status).to.equal(400)
            expect(response.body.error).to.deep.equal("Bad Request")
            expect(response.body.message[0]).to.equal("title must be longer than or equal to 1 characters")
            expect(response.body.message[1]).to.equal("title should not be empty")
        })
    })
    it("Teste de cadastro de filme sem genero", function () {
        cy.request({
            method: "POST",
            url: "/movies",
            body: {
                title: "Perdido em Marte",
                genre: "",
                description: "Matt Damon se encontra em mais uma enrascada e precisa ser salvo, só que dessa vez é fora da terra",
                durationInMinutes: 151,
                releaseYear: 2015
            },
            headers: {
                Authorization: 'Bearer ' + userToken
            },
            failOnStatusCode: false
        }).then(function (response) {

            expect(response.status).to.equal(400)
            expect(response.body.error).to.deep.equal("Bad Request")
            expect(response.body.message[0]).to.equal("genre must be longer than or equal to 1 characters")
            expect(response.body.message[1]).to.equal("genre should not be empty")
        })
    })
    it("Teste de cadastro de filme sem descrição", function () {
        cy.request({
            method: "POST",
            url: "/movies",
            body: {
                title: "Perdido em Marte",
                genre: "Ficção científica/Aventura",
                description: "",
                durationInMinutes: 151,
                releaseYear: 2015
            },
            headers: {
                Authorization: 'Bearer ' + userToken
            },
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.status).to.equal(400)
            expect(response.body.error).to.deep.equal("Bad Request")
            expect(response.body.message[0]).to.equal("description must be longer than or equal to 1 characters")
            expect(response.body.message[1]).to.equal("description should not be empty")
        })
    })
    it("Teste de cadastro de filme sem duração", function () {
        cy.request({
            method: "POST",
            url: "/movies",
            body: {
                title: "Perdido em Marte",
                genre: "Ficção científica/Aventura",
                description: "Matt Damon se encontra em mais uma enrascada e precisa ser salvo, só que dessa vez é fora da terra",
                durationInMinutes: "",
                releaseYear: 2015
            },
            headers: {
                Authorization: 'Bearer ' + userToken
            },
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.status).to.equal(400)
            expect(response.body.error).to.deep.equal("Bad Request")
            expect(response.body.message[0]).to.equal("durationInMinutes must be a number conforming to the specified constraints")
            expect(response.body.message[1]).to.equal("durationInMinutes should not be empty")
        })
    })
    it("Teste de cadastro de filme sem ano de lançamento", function () {
        cy.request({
            method: "POST",
            url: "/movies",
            body: {
                title: "Perdido em Marte",
                genre: "Ficção científica/Aventura",
                description: "Matt Damon se encontra em mais uma enrascada e precisa ser salvo, só que dessa vez é fora da terra",
                durationInMinutes: 151,
                releaseYear: ""
            },
            headers: {
                Authorization: 'Bearer ' + userToken
            },
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.status).to.equal(400)
            expect(response.body.error).to.deep.equal("Bad Request")
            expect(response.body.message[0]).to.equal("releaseYear must be a number conforming to the specified constraints")
            expect(response.body.message[1]).to.equal("releaseYear should not be empty")
        })
    })
})

describe("Testes de Cadastro de filme com usuario administrador", function () {
    const lorem = new LoremIpsum({
        wordsPerSentence: {
            max: 10,
            min: 3
        }
    });
    let uId;
    let userToken;
    let idFilme;
    let titulo = lorem.generateSentences(1);
    let descricao = lorem.generateSentences(1);
    before(function () {
        cy.criaELoga().then(function (userData) {
            uId = userData.userId
            userToken = userData.uToken
        })
    })
    after(function () {
        cy.deletaFilme(idFilme, userToken)
        cy.deletaUser(uId, userToken)
    })
    it("Faz o cadastro de um filme", function () {
        cy.request({
            method: "POST",
            url: "/movies",
            body: {
                title: titulo,
                genre: "Ficção científica/Aventura",
                description: descricao,
                durationInMinutes: 151,
                releaseYear: 2015
            },
            headers: {
                Authorization: 'Bearer ' + userToken
            }
        }).then(function (response) {
            idFilme = response.body.id
            expect(response.status).to.equal(201)
            cy.request({
                method: "GET",
                url: "/movies/" + idFilme
            }).then(function (response) {
                expect(response.status).to.equal(200)
                expect(response.body.id).to.be.deep.equal(idFilme)
                expect(response.body.title).to.be.deep.equal(titulo)
                expect(response.body.genre).to.deep.equal("Ficção científica/Aventura")
                expect(response.body.description).to.be.deep.equal(descricao)
                expect(response.body.durationInMinutes).to.equal(151)
                expect(response.body.releaseYear).to.equal(2015)
            });
        })
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

describe("Testes de atualização de filmes", function () {
    let uId;
    let userToken;
    let idFilme;
    before(function () {
        cy.log("Cria um novo usuario, faz o login e o da permissão de administrador")
        cy.criaELoga().then(function (userData) {
            uId = userData.userId
            userToken = userData.uToken
        }).then(function () {
            cy.log("Cria um filme para o teste")
            cy.criaFilme(userToken).then(function (filmeData) {

                idFilme = filmeData.idFilme
            })
        })
    })
    after(function () {
        cy.deletaFilme(idFilme, userToken)
        cy.deletaUser(uId, userToken)
    })
    it("Testa a alteração do cadastro de um filme", function () {
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
        }).then(function (response) {
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
    })
})
