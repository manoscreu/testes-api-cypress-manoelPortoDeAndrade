import { faker } from "@faker-js/faker";

describe("Teste o login de um usuario inexistente", function () {
    let fakeMail = faker.internet.email()

    before(function () {
        cy.fixture("users/responses/erroUsuarioInvalido").as("erroUsuarioInvalido")
    })

    it("Tenta fazer o login com um usuario inexistente", function () {
        cy.request({
            method: "POST",
            url: "/auth/login",
            body: {
                email: "garantiaDeErro" + fakeMail,
                password: "123456"
            },
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.body).to.deep.equal(this.erroUsuarioInvalido);
            expect(response.status).to.equal(401);
            expect(response.body.error).to.equal("Unauthorized");
            expect(response.body.message).to.equal("Invalid username or password.");
        })
    })
})

describe("Teste Bad Requests", function () {
    it("Tentativa de login sem email", function () {
        cy.request({
            method: "POST",
            url: "/auth/login",
            body: {
                email: "",
                password: "123456"
            }, failOnStatusCode: false
        }).then(function (response) {
            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal("Bad Request")
            expect(response.body.message[0]).to.equal("email should not be empty")
            expect(response.body.message[1]).to.equal("email must be an email")
        })
    })
    it("Tentativa de login sem senha", function () {
        cy.request({
            method: "POST",
            url: "/auth/login",
            body: {
                email: "teste.login@qa.com",
                password: ""
            }, failOnStatusCode: false
        }).then(function (response) {
            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal("Bad Request")
            expect(response.body.message[0]).to.equal("password should not be empty")

        })
    })
})


describe("Teste o login de um usuario existente", function () {
    // posso criar um usuario antes com o command para n ter perigo de perder o user caso a api resete
    let emailTeste = faker.internet.email()
    let nomeTeste = faker.internet.userName()
    let uid
    let token
    before(function () {
        cy.request("POST", "/users", {
            name: nomeTeste,
            email: emailTeste,
            password: "123456"
        }).then(function (response) {
            uid = response.body.id
        })
    })
    it("Faz o login com um usuario existente", function () {
        cy.request("POST", "/auth/login",
            {
                email: emailTeste,
                password: "123456"
            },
        ).then(function (response) {
            token = response.body.accessToken
            expect(response.status).to.equal(200);
            expect(response.body).to.include({
                "accessToken": token
            });
        })
    })
    afterEach(function () {
        cy.request({
            method: "PATCH",
            url: "/users/admin",
            headers: {
                Authorization: 'Bearer ' + token
            },
        }).then(function () {
            cy.request({
                method: "DELETE",
                url: "/users/" + uid,
                headers: {
                    Authorization: 'Bearer ' + token
                }
            })
        })
    })
    
})

