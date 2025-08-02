<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Firebase Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Firebase credentials and project settings.
    |
    */

    'project_id' => env('FIREBASE_PROJECT_ID'),

    'credentials' => [
        'type' => 'service_account',
        'project_id' => env('FIREBASE_PROJECT_ID'),
        'private_key_id' => env('FIREBASE_PRIVATE_KEY_ID'),
        'private_key' => str_replace('\\n', "\n", env('FIREBASE_PRIVATE_KEY')),
        'client_email' => env('FIREBASE_CLIENT_EMAIL'),
        'client_id' => env('FIREBASE_CLIENT_ID'),
        'auth_uri' => env('FIREBASE_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
        'token_uri' => env('FIREBASE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
        'auth_provider_x509_cert_url' => 'https://www.googleapis.com/oauth2/v1/certs',
        'client_x509_cert_url' => env('FIREBASE_CLIENT_X509_CERT_URL'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Firebase Storage
    |--------------------------------------------------------------------------
    |
    | Configuration for Firebase Storage bucket
    |
    */

    'storage' => [
        'bucket' => env('FIREBASE_STORAGE_BUCKET', env('FIREBASE_PROJECT_ID') . '.appspot.com'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Firebase Database
    |--------------------------------------------------------------------------
    |
    | Configuration for Firebase Realtime Database
    |
    */

    'database_url' => env('FIREBASE_DATABASE_URL'),

    /*
    |--------------------------------------------------------------------------
    | Firebase Authentication
    |--------------------------------------------------------------------------
    |
    | Configuration for Firebase Authentication
    |
    */

    'auth' => [
        'verify_password_reset_tokens' => env('FIREBASE_AUTH_VERIFY_PASSWORD_RESET_TOKENS', false),
        'verify_email_verification_tokens' => env('FIREBASE_AUTH_VERIFY_EMAIL_VERIFICATION_TOKENS', false),
    ],
];
