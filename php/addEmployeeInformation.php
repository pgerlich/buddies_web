
<?php

if ( isset($_GET["ACCID"]) && isset($_GET["MONTH"]) && isset($_GET["DAY"])
    && isset($_GET["YEAR"]) && isset($_GET["FIRST"]) && isset($_GET["LAST"]) ) { //Check for inputs
	require_once("stripe/stripe.php");

	\Stripe\Stripe::setApiKey("sk_live_8NPE6faNDGG5RJVXTfIxoD6y");

	$account = \Stripe\Account::retrieve($_GET["ACCID"]);
	$account->legal_entity->dob->month = $_GET['MONTH']; //DOB Month
	$account->legal_entity->dob->day = $_GET['DAY']; //DOB Day
	$account->legal_entity->dob->year = $_GET['YEAR']; //DOB Year
	$account->legal_entity->first_name = $_GET['FIRST']; //Firstname
	$account->legal_entity->last_name = $_GET['LAST']; //Last name
	$account->legal_entity->type = "individual"; //Individual or company
	$account->transfer_schedule->delay_days = 14; //How often to pay
	$account->transfer_schedule->interval = "daily"; //How often to process payments to their account
	$account->save();

	echo $account;
} else {
	echo "Failed";
}

?>