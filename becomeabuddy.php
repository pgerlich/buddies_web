<?php

    require_once 'swiftmailer/lib/swift_required.php';
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
        $to = 'ogubin@iastate.edu';
        $subject = 'Become a Buddy Form Results';

        $body = "From: $name\n E-Mail: $email\n Location: $city\n State: $state\n Zipcode: $zipcode\n How they heard about us: $reference\n Additional Comments: $comments";

            //this is where you send the smtp transport email (connection used)
            $transport = Swift_SmtpTransport::newInstance('smtp.gmail.com', 465, "ssl")
              ->setUsername('ogubin@iastate.edu')
              ->setPassword('password');

            $mailer = Swift_Mailer::newInstance($transport);

            $message = Swift_Message::newInstance('Test Subject')
              ->setFrom(array('registration@buddys.com' => 'BecomeABuddyForm'))
              ->setTo(array('ogubin@iastate.edu'))
              ->setBody($body);




        //Check if simple anti-bot test is correct
        if ($human !== 5) {
            $errHuman = 'Your anti-spam is incorrect';
        }

// If there are no errors, send the email
if (!$errHuman) {
    $result = $mailer->send($message);
    if ($result) {
        $result='<div class="alert alert-success">Thank You! We will be in touch</div>';
} else {
$result='<div class="alert alert-danger">Sorry there was an error sending your message. Please try again later</div>';
}
}
}

?>

<!DOCTYPE html>
<html lang="en" ng-app="myApp">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="shortcut icon" type="image/ico" href="favicon.ico" />

    <title>Buddys Waterless Carwash</title>
    <!-- Agency CSS -->
    <link href="css/agency.css" rel="stylesheet">
    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- Sidr -->
    <link href="css/jquery.sidr.light.css" rel="stylesheet">
    <link href="css/scrolling-nav.css" rel="stylesheet">

    <!-- Footer CSS -->
    <link href="css/footer.css" rel="stylesheet">


    <!-- Custom CSS -->
    <link href="css/custom.css" rel="stylesheet">

    <style>
        #mobile-header {
            display: none;
        }
        @media only screen and (max-width: 767px){
            #mobile-header {
                display: block;
            }
        }
    </style>


    <!-- Font Awesome -->
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

    <!-- Angular -->
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.js"></script>
</head>

<body>
<div id="page-top"></div>


<nav class="navbar navbar-default navbar-fixed-top vcenter ralign" role="navigation" style="background-color: red; z-index:10001;">
      <div class="container">
        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse navbar-ex1-collapse" >
          <ul class="nav navbar-nav">
            <li>
              <a class="smoothScroll" href="index"><img src="img/BuddiesBonlySMALL.png" class="img img-responsive" /></a>
            </li>
          </ul>
        </div>
        <!-- /.navbar-collapse -->
      </div>

       <a id="simple-menu" href="#sidr"><button type="button" class="navbar-toggle" style="display:inline-block;margin-right:15px;background-color: red;">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar" style="background-color: white"></span>
        <span class="icon-bar" style="background-color: white"></span>
        <span class="icon-bar" style="background-color: white"></span>

      </button></a>
      <!-- /.container -->
    </nav>

<div class="container main-content" id="main-content-section" style="padding-bottom:150px; margin-top: 100px;">
    <div class="page-header">
        <h1 style="text-transform: none;">Sign up to be a Buddy!</h1>
    </div>

    <div class="col-sm-12 lead" style="text-align:center;">
        <span><em>"Choose your own hours, make money when you want, become our Buddy!"</em></span>
    </div>

    <form class="form-horizontal" role="form" method="post" action="becomeabuddy.php">
        <div class="form-group">
            <label for="name" class="col-sm-2 control-label">Name</label>
            <div class="col-sm-8">
                <input type="text" class="form-control" id="name" name="name" placeholder="First & Last Name" value="<?php echo htmlspecialchars($_POST['name']); ?>" required>
            </div>
        </div>
        <div class="form-group">
            <label for="email" class="col-sm-2 control-label">Email</label>
            <div class="col-sm-8">
                <input type="email" class="form-control" id="email" name="email" placeholder="example@domain.com" value="<?php echo htmlspecialchars($_POST['email']); ?>" required>
            </div>
        </div>
        <div class="form-group">
            <label for="city" class="col-sm-2 control-label">City</label>
            <div class="col-sm-2">
                <input type="text" class="form-control" id="city" name="city" placeholder="City" value="<?php echo htmlspecialchars($_POST['city']); ?>" required>
            </div>
            <label for="state" class="col-sm-1 control-label">State</label>
            <div class="col-sm-2">
                <input type="text" class="form-control" id="state" name="state" placeholder="State" value="<?php echo htmlspecialchars($_POST['state']); ?>" required>
            </div>
            <label for="zipcode" class="col-sm-1 control-label">Zipcode</label>
            <div class="col-sm-2">
                <input type="text" class="form-control" id="zipcode" name="zipcode" placeholder="Zipcode" value="<?php echo htmlspecialchars($_POST['zipcode']); ?>" required>
            </div>
        </div>
        <div class="form-group">
            <label for="reference" class="col-sm-2 control-label">How'd you hear about us?</label>
            <div class="col-sm-8">
                <textarea class="form-control" rows="4" id="reference" name="reference"><?php echo htmlspecialchars($_POST['reference']); ?></textarea>
            </div>
        </div>
        <div class="form-group">
            <label for="comments" class="col-sm-2 control-label">Additional comments</label>
            <div class="col-sm-8">
                <textarea class="form-control" rows="4" id="comments" name="comments"><?php echo htmlspecialchars($_POST['comments']); ?></textarea>
            </div>
        </div>
        <div class="form-group">
            <label for="human" class="col-sm-2 control-label">2 + 3 = ?</label>
            <div class="col-sm-8">
                <input type="text" class="form-control" id="human" name="human" placeholder="Your Answer" value="<?php echo htmlspecialchars($_POST['human']); ?>">
                <?php echo $errHuman;?>
            </div>
        </div>
        <div class="form-group">
            <div class="col-sm-8 col-sm-offset-2">
                <input id="submit" name="submit" type="submit" value="Send" class="btn btn-primary">
            </div>
        </div>
        <div class="form-group">
            <div class="col-sm-10 col-sm-offset-2">
                <?php echo $result;?>
            </div>
        </div>
    </form>

</div>

<footer class="footer-distributed vcenter">


    <div class="footer-center" style="text-align:center;width:100%">
            <a href="https://www.facebook.com/WaterlessBuddys" target="_BLANK"><i class="fa fa-facebook"></i></a>
            <a href="https://twitter.com/waterlessbuddys" target="_BLANK"><i class="fa fa-twitter"></i></a><br />
  <p class="footer-company-name">Waterless Buddys &copy; 2016</p>
    </div>

</footer>

<div id="sidr" class="sidr" style="transition: left 0.2s ease; display:none;"><div class="sidr-inner">
    <ul class="sidr-class-horizontal sidr-class-menu sidr-class-expanded">
        <li style="padding: 0 15px; font-size: large;">Buddys Waterless Carwash</li>
        <li><a class="sidr-class-smooth" href="index.html">Home</a></li>

        <li class="active"><a class="sidr-class-smooth" href="becomeabuddy.php">Become a Buddy</a></li>


    </ul>
    <hr />
    <div ng-controller="navBar">
        <ul class="sidr-class-horizontal sidr-class-menu sidr-class-expanded">
            <li ng-show="role == -1"><a class="sidr-class-smooth" href="login.html">Login</a></li>
            <li ng-show="role == 0"><a class="sidr-class-smooth" href="schedule.html">Schedule a Wash</a></li>
            <li ng-show="role == 1"><a class="sidr-class-smooth" href="jobs.html">Jobs</a></li>
            <li ng-show="role == 2"><a class="sidr-class-smooth" href="admin.html">Admin</a></li>
            <li ng-show="!(role == -1)"><a class="sidr-class-smooth" href="profile.html">My Profile</a></li>
            <li ng-show="!(role == -1)"><a class="sidr-class-smooth" href="#" onClick="logout()">Logout</a></li>

        </ul>
    </div>
</div></div>

<!-- jQuery -->
<script src="js/jquery.js"></script>

<!-- Bootstrap Core JavaScript -->
<script src="js/bootstrap.min.js"></script>

<!-- Sidr -->
<script src="js/jquery.sidr.js"></script>

<!-- Custom Javascript -->
<script src="js/custom2.js"></script>

<!-- Parse -->
<script src="//www.parsecdn.com/js/parse-1.6.12.min.js"></script>

<!-- Custom JS -->
<script src="js/user-functions.js"></script>


<!-- Profile Management JS -->
<script src="js/navbarIndex.js"></script>

<!-- Hammer.JS Gesture Detection-->
<script src="js/hammer.js"></script>

<!-- Smooth same-page scrolling -->
<script type="text/javascript" src="js/smoothscroll.js"></script>
<!-- Below could handle the sliding menu closing each time a same page link is clicked for the scrolling navigation-->
<script type="text/javascript">
    $(window).scroll(function() {
        if ($(".navbar").offset().top > 50) {
            $(".navbar-fixed-top").addClass("top-nav-collapse");
        } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
        }
    });

</script>


</body>
</html>



