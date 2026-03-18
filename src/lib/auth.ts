import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserSession
} from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''
};

const userPool = new CognitoUserPool(poolData);

export const signIn = (email: string, password: string): Promise<CognitoUserSession> => {
    return new Promise((resolve, reject) => {
        const authenticationData = {
            Username: email,
            Password: password
        };
        const authenticationDetails = new AuthenticationDetails(authenticationData);

        const userData = {
            Username: email,
            Pool: userPool
        };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (session) => {
                resolve(session);
            },
            onFailure: (err) => {
                reject(err);
            },
            newPasswordRequired: (userAttributes) => {
                // Resolve with a special object indicating password change is needed
                // We'll pass the cognitoUser object so we can call completeNewPasswordChallenge later
                resolve({ 
                    challengeName: 'NEW_PASSWORD_REQUIRED', 
                    cognitoUser,
                    userAttributes 
                } as any);
            }
        });
    });
};

export const signOut = () => {
    const user = userPool.getCurrentUser();
    if (user) {
        user.signOut();
    }
};

export const getSession = (): Promise<CognitoUserSession | null> => {
    return new Promise((resolve, reject) => {
        const user = userPool.getCurrentUser();
        if (user) {
            user.getSession((err: any, session: CognitoUserSession | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(session);
                }
            });
        } else {
            resolve(null);
        }
    });
};
