<?php

if ( isset($_GET["CID"]) ) {
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_test_ShQv6vg74LT9CpEa6kXg8dwU"); //TODO: Fix the api key

	echo \Stripe\Customer::retrieve($_GET["CID"]);
}

?>