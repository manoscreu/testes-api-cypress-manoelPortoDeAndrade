import { faker } from "@faker-js/faker";


Cypress.Commands.add("criaELoga", function () {
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
            }).then(function(){
                return {
                    userId: uId,
                    uToken: uToken
                }
            })
        })
    })
})

Cypress.Commands.add("deletaUser", function(id,token){
    cy.request({
        method: "DELETE",
        url: "/users/" + id,
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
})

Cypress.Commands.add("inativaUser", function(email){
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