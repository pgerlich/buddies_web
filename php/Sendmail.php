<?php header('Access-Control-Allow-Origin: *'); ?>
<?php

    require_once '../swiftmailer/lib/swift_required.php';
    if (isset($_POST["submit"])) {
        $name = $_POST['name'];
        $email = $_POST['email'];
        $city = $_POST['city'];
        $state = $_POST['state'];
        $zipcode = $_POST['zipcode'];
        $reference = $_POST['reference'];
        $comments = $_POST['comments'];
        $human = intval($_POST['human']);
        $from = 'Become a Buddy Form Results';
        $to = 'austin@waterlessbuddys.com';
        $subject = 'Become a Buddy Form Results';

        $body = "From: $name\n E-Mail: $email\n Location: $city\n State: $state\n Zipcode: $zipcode\n How they heard about us: $reference\n Additional Comments: $comments";

            //this is where you send the smtp transport email (connection used)
            $transport = Swift_SmtpTransport::newInstance('smtp.gmail.com', 465, "ssl")
              ->setUsername('austin@waterlessbuddys.com')
              ->setPassword('Tarheels16');

            $mailer = Swift_Mailer::newInstance($transport);

            $message = Swift_Message::newInstance('Test Subject')
              ->setFrom(array('registration@buddys.com' => 'BecomeABuddyForm'))
              ->setTo(array('austin@waterlessbuddys.com'))
              ->setBody($body);




        //Check if simple anti-bot test is correct
        if ($human !== 5) {
            $errAlert = 'Your anti-spam is incorrect';
        }


// If there are no errors, send the email
if (!$errAlert) {
    $result = $mailer->send($message);
    if ($result) {
        $result='<div class="alert alert-success">Thank You! We will be in touch</div>';
        echo $result;
    }
    else {
    $result='<div class="alert alert-danger">Sorry there was an error sending your message. Please try again later.</div>';
        echo $result;
         }
    }
else
     {
          $alertMessage='<div class="alert alert-danger">Please fix the following: '.$errAlert.'</div>';
          echo $alertMessage;
     }
}



?>