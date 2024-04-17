import { faker } from "@faker-js/faker";

describe("Criação de um usuario ja existente", function () {
    let criaEmail = faker.internet.email()
    let criaNome = faker.internet.userName()
    before(function () {
        cy.fixture("users/responses/erroEmailInUse").as("emailEmUso")
        cy.request("POST", "/users", {
            name: criaNome,
            email: criaEmail,
            password: "123456"
        })
    })
    afterEach(function () {
        let token
        cy.request("POST", "/auth/login", {
            email: criaEmail,
            password: "123456"
        }).then(function (response) {
            token = response.body.accessToken
            cy.request({
                method: "PATCH",
                url: "/users/inactivate",
                headers: {
                    Authorization: 'Bearer ' + token
                }
            })
        })
    })
    it("Tenta criar um usuario ja existente", function () {
        cy.request({
            method: "POST",
            url: "/users",
            body: {
                name: criaNome,
                email: criaEmail,
                password: "123456"
            },
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.body).to.deep.eq(this.emailEmUso)
            expect(response.status).to.equal(409)
        })
    })
})

describe("Teste de criaçao de usuario com senha invalida", function () {
    beforeEach(function () {
        cy.fixture("users/responses/erroSenhaMenos6Char").as("errosenhamenos6")
        cy.fixture("users/requests/testeCriarUserSenha6Char").as("userSenha6Char")
        cy.fixture("users/responses/erroSenhaMaior12Char").as("erroSenhaMaior12")
        cy.fixture("users/requests/testeCriarUserSenhaMais12Char").as("usuarioMais12")
    })
    it("Tenta criar um usuario com uma senha menor que 6 digitos", function () {
        cy.request({
            method: "POST",
            url: "/users",
            body: this.userSenha6Char,
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.body).to.deep.eq(this.errosenhamenos6)
            expect(response.status).to.equal(400)
        })
    })
    it("Tenta criar um usuario com uma senha maior que 12 digitos", function () {
        cy.request({
            method: "POST",
            url: "/users",
            body: this.usuarioMais12,
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.body).to.deep.eq(this.erroSenhaMaior12)
            expect(response.status).to.equal(400)
        })
    })
})

describe("Criação de usuario aleatorio", function () {
    var fakeName = faker.internet.userName()
    var fakeMail = faker.internet.email()
    let uId
    after(function () {
        cy.request({
            method: "POST",
            url: "/auth/login",
            body: {
                name: fakeName,
                email: fakeMail,
                password: "123456"
            }
        }).then(function (response) {
            let token = response.body.accessToken
            cy.request({
                method: "PATCH",
                url: "/users/admin",
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(function () {
                cy.request({
                    method: "DELETE",
                    url: "/users/" + uId,
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                })
            })
        })
    })
    it("Sempre cria um usuario aletaorio, não deve falhar", function () {
        cy.request({
            method: "POST",
            url: "/users",
            body: {
                name: fakeName,
                email: fakeMail,
                password: "123456"
            }
        })
            .then(function (response) {
                uId = response.body.id
                expect(response.status).to.equal(201);
                expect(typeof response.body.id).to.eq("number");
                expect(response.body).to.deep.include({
                    name: fakeName,
                    email: fakeMail,
                    type: 0,
                    active: true
                })
            });
    });
})