import { Injectable } from '@nestjs/common';
import Typesense, { Client } from 'typesense';

@Injectable()
export class TypesenseService {
  public client: Client;

  constructor() {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: 'localhost',
          port: 8108,
          protocol: 'http',
        },
      ],
      apiKey: 'xyz',
      connectionTimeoutSeconds: 2,
    });
  }

  async ensureCollection() {
  try {
    await this.client.collections('products').retrieve();
    console.log('✅ Typesense collection exists');
  } catch (err) {
    console.log('⚠️ Creating Typesense collection...');

    await this.client.collections().create({
      name: 'products',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'category', type: 'string', facet: true },
        { name: 'color', type: 'string', facet: true },
        { name: 'brand', type: 'string', facet: true },
      ],
    });

    console.log('✅ Collection created');
  }
}

  async indexProduct(product: any) {
    return this.client
      .collections('products')
      .documents()
      .upsert(product);
  }

  async search(query: string) {
    return this.client
      .collections('products')
      .documents()
      .search({
        q: query,
        query_by: 'title,category,brand',
      });
  }
}