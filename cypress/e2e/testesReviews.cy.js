describe("Criaçao de Review", function(){
    let uId
    let userToken
    before(function(){
        cy.criaELoga().then(function(userData) {
            uId = userData.userId
            userToken = userData.uToken
        })
    })
    after(function(){
        cy.deletaUser(uId,userToken)
    })
    it("Faz uma review de um filme", function(){
        cy.request({
            method: "POST",
            url: "/users/review",
            body: {
                "movieId": 1,
                "score": 4,
                "reviewText": "Bão"
              },
            headers: {
                Authorization: 'Bearer ' + userToken
            }
        })
    })
})

describe("Listagem de todos os filmes",function(){
    let uId
    let userToken
    before(function(){
        cy.criaELoga().then(function(userData) {
            uId = userData.userId
            userToken = userData.uToken
        }).then(function(){
            cy.request({
                method: "POST",
                url: "/users/review",
                body: {
                    "movieId": 1,
                    "score": 4,
                    "reviewText": "Bão"
                  },
                headers: {
                    Authorization: 'Bearer ' + userToken
                }
            })
        })
        
    })
    after(function(){
        cy.deletaUser(uId,userToken)
    })
    it("Lista todos os reviews de filmes", function(){
        cy.request({
            method: "GET",
            url: "/users/review/all",
            headers: {
                Authorization: 'Bearer ' + userToken
            }
        }).then(function(response){
            cy.log(response.body)
        })
    })
})

