<?php

if ( isset($_GET["CID"]) && isset($_GET["CARDID"])) {
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_test_ShQv6vg74LT9CpEa6kXg8dwU");

	$cu = \Stripe\Customer::retrieve($_GET["CID"]);
	echo $cu->sources->retrieve($_GET["CARDID"])->delete();
} 

?>