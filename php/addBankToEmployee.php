
<?php

if ( isset($_GET["ACCID"]) && isset($_GET["TOKEN"]) ) { //Check for inputs
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_live_8NPE6faNDGG5RJVXTfIxoD6y");

	$account = \Stripe\Account::retrieve($_GET["ACCID"]);
	$account->external_account = $_GET["TOKEN"];
	$account->save();

	echo $account;
} else {
	echo "Failed";
}

?>