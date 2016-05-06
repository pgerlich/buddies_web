<?php

if ( isset($_GET["TOKEN"]) && isset($_GET["EMAIL"]) ) {
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_test_ShQv6vg74LT9CpEa6kXg8dwU");

	echo \Stripe\Customer::create(array("description" => $_GET["EMAIL"],
	  "source" => $_GET["TOKEN"] // obtained with Stripe.js
	));	
} else {
	echo "Failed";
}

?>