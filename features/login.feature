Feature: User Login and Cart Management

Scenario: Failed login with invalid credential
  Given the user is on the login page
  When the user enters an invalid username and password
  And the user clicks the login button
  Then the user should see a failed message

Scenario: Successfully adding an item to cart
  Given the user is on the login page
  And the user is on the item page
  When the user add item to the cart
  Then item should be seen in the item page

Scenario: Successfully removing an item from cart
  Given the user is on the login page
  And the user is on the item page
  When the user add item to the cart
  And the user remove item to the cart
  Then item shouldn't be seen in the item page

Scenario: Checkout process with one item
  Given the user is on the login page
  And the user is on the item page
  When the user add item to the cart
  And the user proceeds to checkout
  And the user fills checkout information
  And the user completes the checkout
  Then the user should see the checkout complete page

Scenario: Sorting items by price
  Given the user is on the login page
  And the user is on the item page
  When the user sorts items by price low to high
  Then the items should be displayed in ascending price order