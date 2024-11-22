// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PollingSys {
    struct Option {
        uint8 id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint8 vote;
    }

    struct Poll {
        uint8 id;
        address author;
        string title;
        uint8 optionsCount;
        mapping(uint8 => Option) options;
        mapping(address => Voter) voters;
        STATE state;
    }

    enum STATE {
        created,
        voting,
        finished
    }

    uint8 public pollCount;
    mapping(uint8 => Poll) public polls;

    event PollCreated(uint8 pollId, address author, string title);
    event OptionAdded(uint8 pollId, uint8 optionId, string name);
    event Voted(uint8 pollId, address voter, uint8 optionId);
    // Sự kiện để theo dõi thay đổi trạng thái
    event StateChanged(uint8 indexed pollId, STATE newState);

    modifier onlyAuthor(uint8 _pollId) {
        require(msg.sender == polls[_pollId].author, "Only author can manage this poll");
        _;
    }

    modifier validState(uint8 _pollId, STATE x) {
        require(polls[_pollId].state == x, "Invalid poll state");
        _;
    }

    modifier onlyVotingState(uint8 pollId) {
        require(polls[pollId].state == STATE.voting, "Poll is not in the voting phase");
        _;
    }

    function createPoll(string memory _title) public {
        pollCount++;
        Poll storage newPoll = polls[pollCount];
        newPoll.id = pollCount;
        newPoll.author = msg.sender;
        newPoll.title = _title;
        newPoll.state = STATE.created;

        emit PollCreated(pollCount, msg.sender, _title);
    }

    function addOptionsToPoll(uint8 _pollId, string memory _name) 
        public onlyAuthor(_pollId) validState(_pollId, STATE.created) 
    {
        Poll storage poll = polls[_pollId];
        poll.optionsCount++;
        poll.options[poll.optionsCount] = Option(poll.optionsCount, _name, 0);

        emit OptionAdded(_pollId, poll.optionsCount, _name);
    }

    function vote(uint8 _pollId, uint8 _optionId) 
        public onlyVotingState(_pollId)
    {
        Poll storage poll = polls[_pollId];
        Voter storage voter = poll.voters[msg.sender];

        require(!voter.hasVoted, "Voter has already voted");
        require(_optionId > 0 && _optionId <= poll.optionsCount, "Invalid option");

        poll.options[_optionId].voteCount++;
        voter.hasVoted = true;
        voter.vote = _optionId;

        emit Voted(_pollId, msg.sender, _optionId);
    }

//     function getPollResult(uint8 _pollId) public view returns (Option[] memory) {
//     Poll storage poll = polls[_pollId];
//     Option[] memory results = new Option[](poll.optionsCount);

//     for (uint8 i = 1; i <= poll.optionsCount; i++) {
//         Option memory option;
//         option.id = i;
//         option.name = poll.options[i].name;  
//         option.voteCount = poll.options[i].voteCount;
//         results[i - 1] = option;
//     }

//     return results;
// }

    //Hàm get vote count per option
    function getVoteCount(uint8 _pollId, uint8 _optionId) public view returns (uint) {
    return polls[_pollId].options[_optionId].voteCount;
}

    // Hàm get option by id
    function getOptionById(uint8 _pollId, uint8 _optionId) public view returns (Option memory) {
    return polls[_pollId].options[_optionId];
}

    // Hàm để thay đổi trạng thái của poll
function changePollState(uint8 _pollId, STATE _newState) public {
    Poll storage poll = polls[_pollId];

    // Kiểm tra quyền 
    require(msg.sender == poll.author, "Only the creator can change the poll state");

    // Kiểm tra logic (trạng thái mới phải hợp lệ )
    require(_newState > poll.state, "Invalid state transition");

    // Cập nhật trạng thái
    poll.state = _newState;

    // Phát sự kiện
    emit StateChanged(_pollId, _newState);
}


    function getPollResult(uint8 _pollId) 
        public 
        view 
        returns (uint8[] memory optionIds, uint[] memory voteCounts) 
    {
        Poll storage poll = polls[_pollId];
        uint8 count = poll.optionsCount;

        optionIds = new uint8[](count);
        voteCounts = new uint[](count);

        for (uint8 i = 1; i <= count; i++) {
            optionIds[i - 1] = poll.options[i].id;
            voteCounts[i - 1] = poll.options[i].voteCount;
        }

        return (optionIds, voteCounts);
    }

} 