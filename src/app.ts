import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import * as cors from 'cors';
import * as compression from 'compression';
import * as helmet from 'helmet';

import db from './models';
import schema from './graphql/schema';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';
import { DataLoaderFactory } from './graphql/dataLoaders/DataLoaderFactory';
import { RequestedFields } from './graphql/ast/RequestedFields';

class App {

    public express: express.Application;
    private dataLoaderFactory: DataLoaderFactory;
    private requestedFields: RequestedFields;

    constructor() {
        this.express = express();
        this.init();
    }

    private init(): void{
        this.middleware();
        this.requestedFields = new RequestedFields();
        this.dataLoaderFactory = new DataLoaderFactory(db, this.requestedFields);
    }

    private middleware() : void {

        //Define regras ao acesso a api https://github.com/expressjs/cors
        this.express.use(cors({
            origin: "*",
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Enconding'],
            preflightContinue: false,
            optionsSuccessStatus: 204 
        }));

        //Compacta a api tornando-a mais leve
        this.express.use(compression());

        // Segurnça da API, trata o headers https://github.com/helmetjs/helmet
        this.express.use(helmet());

        this.express.use('/graphql' 

            , extractJwtMiddleware()
        
            , (req, res, next) =>{
                req['context']['db'] = db;
                req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders();
                req['context']['requestedFields'] = this.requestedFields; 
                next();
            }
            
            , graphqlHTTP((req) =>  ({
                    schema : schema,
                    graphiql: process.env.NODE_ENV === 'development',
                    context: req['context']
            }))
        );
    }
}

export default new App().express;