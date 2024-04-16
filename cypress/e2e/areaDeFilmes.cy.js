describe("Testes de Cadastro de filme com usuario comum", function () {
    before(function () {
        cy.fixture("users/requests/usuarioDeTestesLogin").as("usuario")
        cy.fixture("users/requests/cadastroFilme").as("filmeTeste")
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
            expect(response.body).to.deep.equal({
                "message": "Access denied.",
                "error": "Unauthorized",
                "statusCode": 401
            })
        })
    })
})

describe("Testes de Cadastro de filme com usuario administrador", function () {
    let userToken
    let tamanhoArray
    before(function () {
        cy.fixture("users/requests/usuarioDeTestesLogin").as("usuario")
        cy.fixture("users/requests/cadastroFilme").as("dadosFilme")
    })

    it("Login e autenticaçao usuario administrador", function () {

        cy.request({
            method: "POST",
            url: "/auth/login",
            body: this.usuario
        }).then(function (response) {
            userToken = response.body.accessToken
            expect(response.status).to.equal(200)
            cy.request({
                method: "PATCH",
                url: "/users/admin",
                headers: {
                    Authorization: 'Bearer ' + userToken
                }
            }).then(function (response) {
                expect(response.status).to.equal(204)
            })
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
})