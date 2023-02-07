export const API_ENDPOINT = process.env.REACT_APP_API_URL || "https://api.cryptex.finance";

export const OAUTH_TOKEN_ENDPOINT = API_ENDPOINT.concat("o/token/");

export const KEEPER_ALL_ENDPOINT = API_ENDPOINT.concat("cryptkeeper/all/");

export const KEEPER_CREATE_ENDPOINT = API_ENDPOINT.concat("cryptkeeper/create/");

export const KEEPER_UPDATE_ENDPOINT = API_ENDPOINT.concat("cryptkeeper/update/");
