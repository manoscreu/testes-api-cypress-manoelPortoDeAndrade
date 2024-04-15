import { faker } from "@faker-js/faker";
let fakeName = faker.internet.userName()
let fakeMail = faker.internet.email()
let uid
let token

//Deleta o usuario criado após todos os testes serem finalizados
after(function () {
    cy.request({
        method: "DELETE",
        url: "users/" + uid,
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
})
describe("Criação de usuario", function () {
    it("Criar um novo usuario", function () {
        cy.request({
            method: "POST",
            url: "users",
            body: {
                name: fakeName,
                email: fakeMail,
                password: "123456"
            }
        }).then(function (response) {
            uid = response.body.id
            expect(response.status).to.equal(201);
            expect(response.body).to.include({
                name: fakeName,
                email: fakeMail
            })
            cy.log(uid)
            cy.log(response.body)
        });
    });
    it("Faz o login do usuario", function () {
        cy.request({
            method: "POST",
            url: "auth/login",
            body: {
                email: fakeMail,
                password: "123456"
            }
        }).then(function (response) {
            token = response.body.accessToken
            expect(response.status).to.equal(200);
            cy.log(token)
            cy.log(response.body)
        })
    })
    it("Dá Permissão de Administrador", function () {
        cy.request({
            method: "PATCH",
            url: "users/admin",
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(function (response) {
            expect(response.status).to.equal(204)
        })
    })
});


