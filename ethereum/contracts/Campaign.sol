pragma solidity ^0.4.20;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint _minimum) public {
        address campaignAddress = new Campaign(msg.sender, _minimum);
        deployedCampaigns.push(campaignAddress);
    }
    
    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint amount;
        address recipient;
        bool complete;
        mapping(address => bool) approvals;
        uint approvalCount;
    }
    
    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;

    
    function Campaign(address _manager,uint _minimumContribution) public {
        manager = _manager;
        minimumContribution = _minimumContribution;
    }
    
    function contribute() public payable {
        require(
            msg.value > minimumContribution
            );
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function createRequest(string description, uint amount, address recipient) public isRestricted {
        Request memory newRequest = Request({
            description: description,
            amount: amount,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        
        requests.push(newRequest);
    }
    
    function approveRequest(uint requestId) public {
        Request storage request = requests[requestId];
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
    function finalizeRequest(uint requestId) public isRestricted {
        Request storage request = requests[requestId];
        
        require(!request.complete);
        require(request.approvalCount > (approversCount / 2));
    
        request.recipient.transfer(request.amount);
        request.complete = true;
    }
    

    modifier isRestricted() {
        require(
            manager == msg.sender
        );
        _;
    }
}
