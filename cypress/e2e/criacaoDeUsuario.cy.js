import { faker } from "@faker-js/faker";
describe("Criação de um usuario ja existente", function () {
    before(function () {
        cy.fixture("users/responses/erroEmailInUse").as("emailEmUso")
        cy.fixture("users/requests/usuarioDeTestesCadastro").as("userExistente")
    })
    it("Tenta criar um usuario ja existente", function () {
        cy.request({
            method: "POST",
            url: "/users",
            body: this.userExistente,
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.body).to.deep.eq(this.emailEmUso)
            expect(response.status).to.equal(409)
        })
    })
})

describe("Criação de um usuario com senha muito curta", function () {
    before(function () {
        cy.fixture("users/responses/erroSenhaMenos6Char").as("errosenhamenos6")
        cy.fixture("users/requests/testeCriarUserSenha6Char").as("userSenha6Char")
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
})

describe("Criação de um usuario com senha muito longa", function () {
    before(function () {
        cy.fixture("users/responses/erroSenhaMaior12Char").as("erroSenhaMaior12")
        cy.fixture("users/requests/testeCriarUserSenhaMais12Char").as("userMais12Char")
    })
    it("Tenta criar um usuario com uma senha maior que 12 digitos", function () {
        cy.request({
            method: "POST",
            url: "/users",
            body: this.userMais12Char,
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