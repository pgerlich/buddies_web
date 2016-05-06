<?php

if ( isset($_GET["CID"]) && isset($_GET["TOKEN"])) {
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_test_ShQv6vg74LT9CpEa6kXg8dwU"); //TODO: Fix the api key

	$cu = \Stripe\Customer::retrieve($_GET["CID"]);
	echo $cu->sources->create(array("source" => $_GET["TOKEN"]));
} 

?>