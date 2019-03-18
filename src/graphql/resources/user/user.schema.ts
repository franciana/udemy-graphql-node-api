const userTypes = ` 

     # User definition types

     type User {
         id: ID!
         name: String! 
         email: String!
         photo: String
         createdAt: String!
         updatedAt: String!
     }

     input UserCreateInput {
        name: String! 
        email: String!
        password: String!
     }

     input UserUpdateInput {
        name: String! 
        email: String!
        photo: String!
     }

     input UserUpadatePasswordInput {
        password: String! 
    }
`;

const userQueries = `
    users(first: Int, offset: Int ): [User! ]!
    user(id: ID!): User
`;

const userMutations = `
    createUser( input: UserCreateInput!): User
    updateUser( id: ID!, input: UserUpdateInput!): User
    updateUserPassword(id: ID!, input: UserUpadatePasswordInput!): Boolean
    deleteUser(id: ID!): Boolean    
`;

export {
    userTypes,
    userQueries,
    userMutations
}