
before(function () {
    cy.fixture("users/requests/usuarioDeTestesLogin").as("usuario")
    cy.fixture("users/requests/filmeUsuarioComum").as("filme")
    let token
    let idFilme
})
describe("Testes de Cadastro de filme com usuario comum", function () {
    it("Login usuario comum", function () {
        cy.request({
            method: "POST",
            url: "auth/login",
            body: this.usuario
        })
    })
    it("Teste de cadastro de filme com um usuario comum", function () {
        cy.request({
            method: "POST",
            url: "movies",
            body: this.filme,
            failOnStatusCode: false
        }).then(function (response) {
            expect(response.status).to.equal(401)
            expect(response.body).to.deep.equal({
                "message": "Access denied.",
                "error": "Unauthorized",
                "statusCode": 401
            })
        })
    })
})

describe("Testes de Cadastro de filme com usuario administrador", function () {
    it("Login e autenticaçao usuario administrador", function () {
        cy.request({
            method: "POST",
            url: "auth/login",
            body: this.usuario
        }).then(function (response) {
            token = response.body.accessToken
            cy.request({
                method: "PATCH",
                url: "users/admin",
                headers: {
                    Authorization: 'Bearer ' + token
                }
            })
        })
    })
    it("Testa o cadastro de um filme como um usuario administrado", function () {
        cy.request({
            method: "POST",
            url: "movies",
            body: this.filme,
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(function (response) {
            expect(response.status).to.eq(201)
            expect(response.body).to.include("title")
        })
    })
})