<?php

if ( isset($_GET["EMAIL"]) ) {
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_live_8NPE6faNDGG5RJVXTfIxoD6y");

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