import { faker } from "@faker-js/faker";


Cypress.Commands.add("criaELoga", function () {
    cy.log("Cria um usuario, faz o login e da permissão de ADM ")
    let emailTeste = faker.internet.email();
    let nomeTeste = faker.internet.userName();
    let uId;
    let uToken;
    cy.request("POST", "/users", {
        name: nomeTeste,
        email: emailTeste,
        password: "123456"
    }).then(function (response) {
        uId = response.body.id
        return cy.request("POST", "/auth/login", {
            email: emailTeste,
            password: "123456"
        }).then(function (response) {
            uToken = response.body.accessToken
            cy.request({
                method: "PATCH",
                url: "/users/admin",
                headers: {
                    Authorization: 'Bearer ' + uToken
                }
            }).then(function () {
                return {
                    userId: uId,
                    uToken: uToken
                }
            })
        })
    })
})

Cypress.Commands.add("deletaUser", function (id, token) {
    cy.log("Deletando o usuario")
    cy.request({
        method: "DELETE",
        url: "/users/" + id,
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
})

Cypress.Commands.add("inativaUser", function (token) {
    cy.request({
        method: "PATCH",
        url: "/users/inactivate",
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
})


Cypress.Commands.add("logaEInativaUser", function (email) {
    cy.log("Inativando o usuario")
    let token
    cy.request("POST", "/auth/login", {
        email: email,
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

Cypress.Commands.add("criaELogaCritico", function () {
    cy.log("Cria um usuario, faz login e da permissão de critico")
    let emailTeste = faker.internet.email();
    let nomeTeste = faker.internet.userName();
    let uId;
    let uToken;
    cy.request("POST", "/users", {
        name: nomeTeste,
        email: emailTeste,
        password: "123456"
    }).then(function (response) {
        uId = response.body.id
        return cy.request("POST", "/auth/login", {
            email: emailTeste,
            password: "123456"
        }).then(function (response) {
            uToken = response.body.accessToken
            cy.request({
                method: "PATCH",
                url: "/users/apply",
                headers: {
                    Authorization: 'Bearer ' + uToken
                }
            }).then(function () {
                return {
                    userId: uId,
                    uToken: uToken
                }
            })
        })
    })
})

