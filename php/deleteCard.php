<?php

if ( isset($_GET["CID"]) && isset($_GET["CARDID"])) {
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_live_8NPE6faNDGG5RJVXTfIxoD6y");

	$cu = \Stripe\Customer::retrieve($_GET["CID"]);
	echo $cu->sources->retrieve($_GET["CARDID"])->delete();
} 

?>