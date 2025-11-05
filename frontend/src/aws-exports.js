const awsconfig = {
  //  Core region and Cognito setup
  aws_project_region: "eu-north-1",
  aws_cognito_region: "eu-north-1",
  aws_user_pools_id: "eu-north-1_ZEYEnwVPm", // User Pool ID
  aws_user_pools_web_client_id: "1emg2lb35h436dht410anau66s", // App Client ID
  authenticationFlowType: "USER_PASSWORD_AUTH",

  //  Optional API setup — still valid at root level
  aws_cloud_logic_custom: [
    {
      name: "BudgetBlissAPI",
      endpoint: "https://abc123xyz.execute-api.eu-north-1.amazonaws.com/prod",
      region: "eu-north-1",
    },
  ],
};

export default awsconfig;
