import { OAUTH_TOKEN_ENDPOINT } from "./constants";

const qs = require("qs");

const OAUTH_HEADER = {
  Accept: "application/json",
  "Content-Type": "application/x-www-form-urlencoded;",
};

export const getAccessToken = async () => {
  let returnData = { success: false, accessToken: "" };
  const params = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.REACT_APP_API_CLIENT_ID,
    client_secret: process.env.REACT_APP_API_CLIENT_SECRET,
  });

  await fetch(OAUTH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: OAUTH_HEADER,
    body: params,
  })
    .then((response) => response.json())
    .then((responseJson) => {
      if (!responseJson.error) {
        returnData = {
          success: true,
          accessToken: responseJson.access_token,
        };
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return returnData;
};
