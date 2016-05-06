<?php

if ( isset($_GET["CID"]) ) {
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_live_8NPE6faNDGG5RJVXTfIxoD6y"); //TODO: Fix the api key

	echo \Stripe\Customer::retrieve($_GET["CID"]);
}

?>