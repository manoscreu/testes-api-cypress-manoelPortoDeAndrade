// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import { LoremIpsum } from "lorem-ipsum";

Cypress.Commands.add("criaFilme", function (uToken) {
    cy.log("Cria um filme para testes")
    const lorem = new LoremIpsum({
        wordsPerSentence: {
            max: 10,
            min: 3
        }
    });
    let idFilme;
    let titulo = lorem.generateSentences(1)
    let descricao = lorem.generateSentences(1)
    cy.request({
        method: "POST",
        url: "/movies",
        body: {
            title: titulo,
            genre: "Ficção científica/Aventura",
            description: descricao,
            durationInMinutes: 151,
            releaseYear: 2015
        },
        headers: {
            Authorization: 'Bearer ' + uToken
        }
    }).then(function (response) {
        idFilme = response.body.id
        return {
            titulo: titulo,
            descricao: descricao,
            idFilme: idFilme
        }
    })
})

Cypress.Commands.add("editaFilme", function (uId, uToken) {
    cy.request({
        method: "PUT",
        url: "movies/" + uId,
        body: {
            "title": "Perdido em Marte",
            "genre": "Ficção científica/Aventura",
            "description": "Matt Damon se encontra em mais uma enrascada e precisa ser salvo, só que dessa vez é fora da terra",
            "durationInMinutes": 151,
            "releaseYear": 2015
        },
        headers: {
            Authorization: 'Bearer ' + uToken
        }
    }).then(function (response) {
        expect(response.status).to.equal(204)
    })
})

Cypress.Commands.add("deletaFilme", function (idFilme, uToken) {
    cy.log("Deletando o filme")
    cy.request({
        method: "DELETE",
        url: "movies/" + idFilme,
        headers: {
            Authorization: 'Bearer ' + uToken
        }
    })
})