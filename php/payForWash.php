<?php

if ( isset($_GET['TIPAMT']) && isset($_GET['BASEAMT']) && isset($_GET['CID']) && isset($_GET['AID']) && isset($_GET['CCID']))
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_test_ShQv6vg74LT9CpEa6kXg8dwU");

	$baseAmount = $_GET['BASEAMT'];
	$tip = $_GET['TIPAMT'];
	$buddysFee = $baseAmount / 2;

	$customerId = $_GET['CID'];
	$creditCard = $_GET['CCID'];
	$employeeId = $_GET['AID'];
	
	$success = False;

	//Someone is trying to hack us and pay less
	if ( $baseAmount < 2000 ) {
		echo "fraudulent charge detected.";
	//Process charge
	} else {
		echo \Stripe\Charge::create(array(
		  "amount" => $baseAmount + $tip,
		  "currency" => "usd",
		  "application_fee" => $buddysFee,
		  "customer" => $customerId,
		  "source" => $creditCard,
		  "destination" => $employeeId,
		  "description" => "Charge for Waterless Buddys car wash."
		));	
	}
	
?>