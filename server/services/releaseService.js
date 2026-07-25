
//  this file Runs automatically every day.

//  for
//   Checksing all locked budgets and releases money whose
//   release date has arrived.


const cron = require("node-cron");

const LockedBudget = require("../models/LockedBudget");



//  Start Daily Release Checker

exports.startReleaseService = () => {

    // Every day at midnight
    cron.schedule(

        "0 0 * * *",

        async () => {

            console.log(
                "Checking scheduled money releases..."
            );

            try {

                // Current date
                const today = new Date();

                // Remove time portion
                today.setHours(
                    0,
                    0,
                    0,
                    0
                );


                // Find every locked budget
                const lockedBudgets =
                    await LockedBudget.find();


                // Loop through each budget
                for (const budget of lockedBudgets) {

                    let updated = false;


                    // Check every scheduled release
                    budget.releases.forEach(

                        release => {

                            const releaseDate =
                                new Date(
                                    release.releaseDate
                                );

                            releaseDate.setHours(
                                0,
                                0,
                                0,
                                0
                            );


                            // Release if date reached
                            if (

                                !release.released &&

                                releaseDate <= today

                            ) {

                                release.released = true;

                                updated = true;

                                console.log(

                                    `Released ${release.category} (${release.amount})`

                                );

                            }

                        }

                    );


                    // Save only if changes were made
                    if (updated) {

                        await budget.save();

                    }

                }

            }

            catch (error) {

                console.error(

                    "Release Service Error:",

                    error.message

                );

            }

        }

    );

};