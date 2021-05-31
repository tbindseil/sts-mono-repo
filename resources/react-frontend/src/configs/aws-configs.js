const awsConfig = {
    aws_app_analytics: 'enable',

    aws_user_pools: 'enable',
    aws_user_pools_id: 'us-west-2_VSZtACGzT', // aws console -> cognito -> general settings (on left) -> pool id
    aws_user_pools_mfa_type: 'OFF',
    aws_user_pools_web_client_id: '1juq6mcq852eu3bho4fh6b8fc', // aws console -> cognito -> App Clients (on left) -> App client Id
    aws_user_settings: 'enable',
};

export default awsConfig
