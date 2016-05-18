
<?php

if ( isset($_GET["ACCID"]) && isset($_GET["TOKEN"]) ) { //Check for inputs
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_test_ShQv6vg74LT9CpEa6kXg8dwU");

	$account = \Stripe\Account::retrieve($_GET["ACCID"]);
	$account->external_account = $_GET["TOKEN"];
	$account->save();

	echo $account;
} else {
	echo "Failed";
}

?>