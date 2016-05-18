<?php

if ( isset($_GET["EMAIL"]) ) {
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_test_ShQv6vg74LT9CpEa6kXg8dwU");

	echo \Stripe\Account::create(
	  array(
	    "country" => "US",
	    "managed" => true,
	    "email" => $_GET["EMAIL"]
	  )
	);
} else {
	echo "Failed";
}

?>