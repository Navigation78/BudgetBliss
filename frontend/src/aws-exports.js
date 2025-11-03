const awsmobile = {
    aws_project_region: "eu-north-1", 
    aws_cognito_region: "eu-north-1",
    aws_user_pools_id: "eu-north-1_ZEYEnwVPm", //User Pool ID
    aws_user_pools_web_client_id: "1emg2lb35h436dht410anau66s", // App Client ID
    oauth: {},
    aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
    aws_cloud_logic_custom: [
        {
            name: "BudgetBlissAPI",
            endpoint: "https://abc123xyz.execute-api.eu-north-1.amazonaws.com/prod", // your API Gateway URL
            region: "eu-north-1"
        }
    ]
};

export default awsmobile;
