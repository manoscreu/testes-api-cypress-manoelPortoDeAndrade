import { faker } from "@faker-js/faker";
const fakeName = faker.internet.userName()
const fakeMail = faker.internet.email()

before(function () {
    cy.fixture("users/requests/usuarioDeTestesCadastro").as("userExistente")
    cy.fixture("users/responses/erroEmailInUse").as("emailEmUso")
    cy.fixture("users/responses/erroSenhaMenos6Char").as("errosenhamenos6")
})
after(function (response) {
    cy.request({
        method: "POST",
        url: "auth/login",
        body: {
            name: fakeName,
            email: fakeMail,
            password: "123456"
        }.then(function (response) {
            let token = response.body.accessToken
            cy.request({
                method: "POST",
                url: "auth/login",
                body: {
                    name: fakeName,
                    email: fakeMail,
                    password: "123456"
                },
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(function () {
                cy.request({
                    method: "POST",
                    url: "users/" + uId,
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                })
            })
        })
    })
})

describe("Criação de um usuario ja existente", function () {
    it("Tenta criar um usuario ja existente", function () {
        cy.request({
            method: "POST",
            url: "users",
            body: this.userExistente,
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.body).to.deep.eq(this.emailEmUso)
            expect(response.status).to.equal(409)
        })
    })
})

describe("Criação de um usuario com senha muito curta", function () {
    it("Tenta criar um usuario com uma senha menor que 6 digitos", function () {
        cy.request({
            method: "POST",
            url: "users",
            body: {
                name: "Manoel",
                email: "manel@qa.com",
                password: "1234"
            },
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.body).to.deep.eq(this.errosenhamenos6)
            expect(response.status).to.equal(400)
        })
    })
})

describe("Criação de um usuario com senha muito longa", function () {
    it("Tenta criar um usuario com uma senha maior que 12 digitos", function () {
        cy.request({
            method: "POST",
            url: "users",
            body: {
                name: "Manoel",
                email: "manel@qa.com",
                password: "12345647891011"
            },
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.body).to.deep.eq({
                "message": [
                    "password must be shorter than or equal to 12 characters"
                ],
                "error": "Bad Request",
                "statusCode": 400
            })
            expect(response.status).to.equal(400)
        })
    })
})

describe("Criação de usuario aleatorio", function () {
    it("Sempre cria um usuario aletaorio, não deve falhar", function () {
        cy.request({
            method: "POST",
            url: "users",
            body: {
                name: fakeName,
                email: fakeMail,
                password: "123456"
            }
        })
            .then(function (response) {
                let uId = response.body.id
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
