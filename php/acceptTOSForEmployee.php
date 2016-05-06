
<?php

if ( isset($_GET["ACCID"]) ) { //Check for inputs
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_test_ShQv6vg74LT9CpEa6kXg8dwU");

	$account = \Stripe\Account::retrieve($_GET["ACCID"]);
	$account->tos_acceptance->date = time();
	$account->tos_acceptance->ip = $_SERVER['REMOTE_ADDR'];
	$account->save();

	echo $account;
} else {
	echo "Failed";
}

?>