import * as fs from 'fs';
import * as path from 'path';
import * as  Sequelize from 'sequelize';
import { DbConnection } from '../interfaces/DbConnectionInterface';

const basename: string = path.basename(module.filename);

const env: string = process.env.NODE_ENV || 'development';
let config = require(path.resolve(`${__dirname}./../config/config.json`))[env];

console.log(config);

let db = null;

if(!db){

    db = {} ;

    const operatorsAliases = {
        $in: Sequelize.Op.in
    };

    config = Object.assign({operatorsAliases}, config);

    const sequelize: Sequelize.Sequelize = new Sequelize( 
        config.database,
        config.username,
        config.password,
        config
    );

    fs.readdirSync(__dirname)
        .filter((file: string) => {
            const fileSlice:string = file.slice(-3);
            return (file.indexOf('.') !== 0) && (file !== basename) && (( fileSlice ==='.js') || (fileSlice ==='.ts'))
        })
        .forEach((file: string) =>{
            const model = sequelize.import(path.join(__dirname, file));
            db[model['name']] = model;
        })
      
        /**
         * Neste post o db tem três atributos, são eles:
         * db.User
         * db.Post
         * db.Comment
         */

         Object.keys(db).forEach((modeName: string) =>{
             if(db[modeName].associate){
                 db[modeName].associate(db);
             }
         });

         //Será usado para sincronizar o sequelize com o mysql
         db['sequelize'] = sequelize;
}

export default <DbConnection>db;