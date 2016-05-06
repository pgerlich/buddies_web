<?php

if ( isset($_GET["TOKEN"]) && isset($_GET["EMAIL"]) ) {
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_live_8NPE6faNDGG5RJVXTfIxoD6y");

	echo \Stripe\Customer::create(array("description" => $_GET["EMAIL"],
	  "source" => $_GET["TOKEN"] // obtained with Stripe.js
	));	
} else {
	echo "Failed";
}

?>