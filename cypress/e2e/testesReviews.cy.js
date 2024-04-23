describe("Criaçao de Review", function () {
    let uId
    let userToken
    let idFilme
    before(function () {
        cy.criaELoga().then(function (userData) {
            uId = userData.userId
            userToken = userData.uToken
        }).then(function () {
            cy.criaFilme(userToken).then(function (filmeData) {
                idFilme = filmeData.idFilme
            })
        })

    })
    after(function () {
        cy.deletaFilme(idFilme, userToken)
        cy.deletaUser(uId, userToken)
    })
    it("Faz uma review de um filme", function () {
        cy.request({
            method: "POST",
            url: "/users/review",
            body: {
                "movieId": idFilme,
                "score": 4,
                "reviewText": "Bão"
            },
            headers: {
                Authorization: 'Bearer ' + userToken
            }
        })
    })
})

describe("Listagem de reviews feitas por um usuario", function () {
    let uId
    let userToken
    let idFilme
    before(function () {
        cy.criaELoga().then(function (userData) {
            uId = userData.userId
            userToken = userData.uToken
        }).then(function () {
            cy.criaFilme(userToken).then(function (filmeData) {
                idFilme = filmeData.idFilme
                cy.request({
                    method: "POST",
                    url: "/users/review",
                    body: {
                        "movieId": idFilme,
                        "score": 4,
                        "reviewText": "Bão"
                    },
                    headers: {
                        Authorization: 'Bearer ' + userToken
                    }
                })
            })
        })

    })
    after(function () {
        cy.deletaFilme(idFilme, userToken)
        cy.deletaUser(uId, userToken)
    })
    it("Lista todos os reviews de filmes postados pelo usuario", function () {
        cy.request({
            method: "GET",
            url: "/users/review/all",
            headers: {
                Authorization: 'Bearer ' + userToken
            }
        }).then(function (response) {
            cy.log(response.body)
        })
    })
})

describe("Teste de reviews usuario critico", function () {
    let userId;
    let token;
    let idFilme;
    let tituloFilme;
    before(function () {
        cy.criaELoga().then(function (userData) {
            userId = userData.userId
            token = userData.uToken
        }).then(function () {
            cy.criaFilme(token)
        }).then(function (filmeData) {
            tituloFilme = filmeData.titulo
            idFilme = filmeData.idFilme
            cy.deletaUser(userId, token)
        }).then(function () {
            cy.criaELogaCritico().then(function (userData) {
                userId = userData.userId
                token = userData.uToken
            })
        })
    })
    after(function () {
        cy.inativaUser(token)
        cy.criaELoga().then(function (userData) {
            userId = userData.userId
            token = userData.uToken
            cy.deletaFilme(idFilme, token)
        })
    })
    it("Faz uma review com um usuario critico e a verifica", function () {
        cy.request({
            method: "POST",
            url: "/users/review",
            body: {
                "movieId": idFilme,
                "score": 4,
                "reviewText": "Bão"
            },
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(function () {
            cy.request({
                method: "GET",
                url: "/users/review/all",
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(function (response) {
                cy.log(response.body)
                expect(response.body[0]).to.include({
                    movieId: idFilme,
                    movieTitle: tituloFilme,
                    reviewText: "Bão",
                    score: 4
                })
            })
        })

    })
})

