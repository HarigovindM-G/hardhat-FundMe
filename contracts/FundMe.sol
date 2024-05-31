// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error NotOwner();

/// @title This is a contract for crowd funding
/// @author Harigovind M G
/// @notice This contract is a sample contract 

contract FundMe{

    using PriceConverter for uint256;

    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    uint256 public constant MINIMUM_USD= 50 * 1e18;
    
    address[] private s_funders;

    // Dictionary to store the address and amount 
    mapping(address=>uint256) private s_addressToAmount;

    modifier onlyOwner{
        // require(msg.sender==i_owner ,"Only Owner can withdraw funds");
        if(msg.sender!=i_owner){revert NotOwner();}
        _;
        // _ represents the rest of the code 
    }

    constructor(address priceFeedAddress){
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner=msg.sender;
    }

    // to handle payment directly to the contract without call data 
    receive() external payable {
        fund();
     }

    // to handle payment directly to the contract with call data 
     fallback() external payable {
        fund();
     }
       
    

    /**
    * @notice This fucntion is used to fund the contract
    * @dev This implements price feed as our library 
    */

   
   
    function fund() public payable{

        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD ,"Dint send enough Ether");
        s_funders.push(msg.sender);
        s_addressToAmount[msg.sender] += msg.value ;
        // we give *1e18 because , msg.value is in wei, 1 eth = 1e18
        // ETH-USD contract address 0x694AA1769357215DE4FAC081bf1f309aDC325306 , fetched from the price feed address in chain link docs
    }
    
    /**
     * @notice This function is used for withdrawing funds from the contract 
     * @dev an onlyOwner modifier is used here to only allow the contract owner to withdraw
     */

    function withdraw() public onlyOwner {
        
        //setting the mapping to zero
        for (uint256 i=0; i<s_funders.length; i++) 
        {
          address funder = s_funders[i];
          s_addressToAmount[funder]= 0;
        }
        //resetting the funder array 
        s_funders = new address[](0);

        //withdrawing the fund from the contract
        // We are using call function here , send and tranfer can also be used 
        (bool callSuc,)=payable(msg.sender).call{value: address(this).balance}("");
        require(callSuc,"Call failed");

    }
    
    function cheaperWithdraw() public onlyOwner{
        address[] memory funders = s_funders;
        uint256 fundersLength = funders.length;
        for(uint256 i=0;i<fundersLength;i++){
            address funder = funders[i];
            s_addressToAmount[funder]=0;
        }
        s_funders= new address[](0);

        (bool callSuc,)=payable(msg.sender).call{value: address(this).balance}("");
        require(callSuc,"Call failed");
    }

    function getOwner() public view returns(address){
        return i_owner;
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return s_priceFeed;
   }

   function getFunders(uint256 index) public view returns(address){
        return s_funders[index];
   }
   
   function getAddresstoAmt(address funder) public view returns(uint256){
        return s_addressToAmount[funder];
   }

}