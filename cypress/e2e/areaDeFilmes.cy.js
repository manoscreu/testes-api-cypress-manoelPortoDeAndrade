import { faker } from "@faker-js/faker";


describe("Testes de Cadastro de filme sem usuario conectado", function () {
    before(function(){
        cy.fixture("users/responses/erroUserNaoAutorizado").as("erroNaoAutorizado")
    })
    it("Tenta fazer o cadastro de um filme sem logar em um usuario",function(){
        cy.request({
            method: "POST",
            url: "/movies",
            body: this.filmeTeste,
            failOnStatusCode: false
        }).then(function (response) {
            
            expect(response.status).to.equal(401)
            expect(response.body).to.deep.equal(this.erroNaoAutorizado)
        })
    })
})

describe("Testes de Cadastro de filme com usuario comum", function () {
    before(function () {
        cy.fixture("users/requests/usuarioDeTestesLogin").as("usuario")
        cy.fixture("users/requests/cadastroFilme").as("filmeTeste")
        cy.fixture("users/responses/erroUserNaoAutorizado").as("erroNaoAutorizado")
    })
    it("Login usuario comum e tenta cadastrar um filme", function () {
        cy.request({
            method: "POST",
            url: "/auth/login",
            body: this.usuario
        })
        cy.request({
            method: "POST",
            url: "/movies",
            body: this.filmeTeste,
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.status).to.equal(401)
            expect(response.body).to.deep.equal(this.erroNaoAutorizado)
        })
    })
})

describe("Testes de Cadastro de filme com usuario administrador", function () {
    let userToken
    let tamanhoArray
    let emailTeste = faker.internet.email()
    let nomeTeste = faker.internet.userName()
    let uid
    before(function () {
        cy.fixture("users/requests/usuarioDeTestesLogin").as("usuario")
        cy.fixture("users/requests/cadastroFilme").as("dadosFilme")
        cy.request("POST", "/users", {
            name: nomeTeste,
            email: emailTeste,
            password: "123456"
        }).then(function (response) {
            uid = response.body.id
            cy.request("POST", "/auth/login", {
                email: emailTeste,
                password: "123456"
            }).then(function (response) {
                userToken = response.body.accessToken
                expect(response.status).to.equal(200)
                cy.request({
                    method: "PATCH",
                    url: "/users/admin",
                    headers: {
                        Authorization: 'Bearer ' + userToken
                    }
                })
            })
        })
    })
    after(function () {
        cy.request({
            method: "DELETE",
            url: "/users/" + uid,
            headers: {
                Authorization: 'Bearer ' + userToken
            }
        })
    })
    it("Faz o login de um usuario administrador e cadastra um filme", function () {
        cy.request({
            method: "POST",
            url: "/movies",
            body: this.dadosFilme,
            headers: {
                Authorization: 'Bearer ' + userToken
            }
        }).then(function (response) {
            expect(response.status).to.equal(201)
        })
        cy.request({
            method: "GET",
            url: "/movies"
        }).then(function (response) {
            tamanhoArray = response.body.length - 1
            expect(response.status).to.equal(200)
            expect(response.body[tamanhoArray]).to.include(this.dadosFilme)
        })
    })

})

describe("Testes de busca de filmes", function(){
    let tamanhoArray 
    it("Lista todos os filmes sem ordem de avaliaçoes e verifica o primeiro criado e o ultimo criado",function(){
        cy.request({
            method: "GET",
            url: "/movies",
            sort: false
        }).then(function(response){
            expect(response.body).to.be.an("array")
            tamanhoArray = response.body.length-1
            cy.log(response.body[0])
            cy.log(response.body[tamanhoArray])
        })
    })
    it("Lista todos os filmes por ordem de avaliação e verifica os com maior e menor avaliação ",function(){
        cy.request({
            method: "GET",
            url: "/movies",
            sort: true
        }).then(function(response){
            expect(response.body).to.be.an("array")
            tamanhoArray = response.body.length-1
            cy.log(response.body)
            cy.log(response.body[0])
            cy.log(response.body[tamanhoArray])
        })
    })
    it("Verifica o ultimo filme cadastrado ",function(){
        cy.request({
            method: "GET",
            url: "/movies",
            sort: false
        }).then(function(response){
            expect(response.body).to.be.an("array")
            tamanhoArray = response.body.length-1
            expect(response.body[tamanhoArray].id).to.be.an("number")
            expect(response.body[tamanhoArray].title).to.be.an("string")
            expect(response.body[tamanhoArray].genre).to.be.an("string")
            expect(response.body[tamanhoArray].description).to.be.an("string")
            expect(response.body[tamanhoArray].durationInMinutes).to.be.an("number")
            expect(response.body[tamanhoArray].releaseYear).to.be.an("number")

        })
    })
})


