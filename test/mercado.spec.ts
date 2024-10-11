import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import * as fakerBr from 'faker-br';

describe('Mercado API Testing', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api-desafio-qa.onrender.com';

  p.request.setDefaultTimeout(100000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Main Mercado', () => {
    let mercadoId = '';
    let mercadoNome = fakerBr.company.companyName();  

    it('Deve buscar todos os mercados', async () => {
      await p.spec().get(`${baseUrl}/mercado`).expectStatus(StatusCodes.OK); //.inspect();
    });

    it('Deve criar novo mercado', async () => {
        mercadoId = await p
          .spec()
          .post(`${baseUrl}/mercado`)
          .withJson({
            nome: mercadoNome,
            cnpj: fakerBr.br.cnpj(),
            endereco: 'Rua Pedro henrique alberto'
          })
          .expectStatus(StatusCodes.CREATED)
          .expectBodyContains(mercadoNome)
          .inspect()
          .returns('novoMercado.id');
    });

    it('Deve buscar o mercado criado por ID', async () => {
        const mercado = await p
          .spec()
          .get(`${baseUrl}/mercado/${mercadoId}`)
          .expectStatus(StatusCodes.OK)
          //.expectBodyContains(mercadoNome)
          .inspect();
    });

    it('Deve criar fruta no mercado', async () => {
        await p
            .spec()
            .post(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas`)
            .withJson({
            nome: 'Balango lango',
            valor: faker.number.int()
            })
            .expectStatus(StatusCodes.CREATED)
            .expectBodyContains('Balango lango')
            .inspect();
    });

    it('Deve buscar as frutas', async () => {
        await p
            .spec()
            .get(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas`)
            .expectStatus(StatusCodes.OK)
            .inspect();
    });

    it('Deve deletar uma fruta criada', async () => {
        const frutaId = await p
            .spec()
            .post(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas`)
            .withJson({
                nome: 'Pessego',
                valor: faker.number.int()
            })
            .expectStatus(StatusCodes.CREATED)
            .expectBodyContains('Pessego')
            .inspect()
            .returns('product_item.id');
        
        await p
            .spec()
            .get(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas`)
            .expectStatus(StatusCodes.OK)
            //.expectBodyContains(frutaId)
            .inspect();

        await p
            .spec()
            .delete(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas/${frutaId}`)
            .expectStatus(StatusCodes.OK)
            .inspect();

        await p
            .spec()
            .get(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas`)
            .expectStatus(StatusCodes.OK)
            .expectJsonLike({
                produtos: {
                    frutas: (frutas) => frutas.every((fruta) => fruta.id !== frutaId)
                }
            })
            .inspect();
    });

    
  });

  /**describe('ALBUMS', () => {
    it('criar um novo album', async () => {
      await p
        .spec()
        .post(`${baseUrl}/albums`)
        .withJson({
          userId: 1,
          title: 'album do bootcamp'
        })
        .expectStatus(StatusCodes.CREATED);
    });
  });**/
});
