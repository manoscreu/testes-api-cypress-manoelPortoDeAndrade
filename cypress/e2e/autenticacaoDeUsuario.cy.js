import { faker } from "@faker-js/faker";
let fakeMail = faker.internet.email()
let token

before(function () {
    cy.fixture("users/requests/usuarioDeTestesLogin").as("LoginExistente")
})

describe("Teste o login de um usuario inexistente", function () {
    it("Tenta fazer o login com um usuario inexistente", function () {
        cy.request({
            method: "POST",
            url: "auth/login",
            body: {
                email: fakeMail,
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
    it("Faz o login com um usuario existente", function () {
        cy.request({
            method: "POST",
            url: "auth/login",
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