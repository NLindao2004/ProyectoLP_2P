<?php
echo json_encode([
    'success' => true,
    'status' => 'OK',
    'service' => 'Terraverde API',
    'version' => '1.0.0',
    'message' => 'Backend funcionando correctamente',
    'timestamp' => date('c')
]);
?>
