import { faker } from "@faker-js/faker";

describe("Teste o login de um usuario inexistente", function () {
    let fakeMail = faker.internet.email()
    it("Tenta fazer o login com um usuario inexistente", function () {
        cy.request({
            method: "POST",
            url: "/auth/login",
            body: {
                email: "garantiaDeErro"+fakeMail,
                password: "123456"
            },
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.status).to.equal(401);
            expect(response.body).to.deep.equal({
                "message": "Invalid username or password.",
                "error": "Unauthorized",
                "statusCode": 401
            });
            cy.log(response.body)
        })
    })
})


describe("Teste o login de um usuario existente", function () {
    // posso criar um usuario antes com o command para n ter perigo de perder o user caso a api resete
    let token
    before(function () {
        cy.fixture("users/requests/usuarioDeTestesLogin").as("LoginExistente")
    })
    it("Faz o login com um usuario existente", function () {
        cy.request({
            method: "POST",
            url: "/auth/login",
            body: this.LoginExistente,
        }).then(function (response) {
            token = response.body.accessToken
            expect(response.status).to.equal(200);
            expect(response.body).to.include({
                "accessToken": token
              });
        })
    })
})