import hashlib
import json
import time
from dataclasses import dataclass, asdict
from typing import List, Optional


# =========================
# 交易数据结构
# =========================
@dataclass
class Transaction:
    sender: str
    recipient: str
    amount: float
    timestamp: float

    def to_dict(self):
        return {
            "sender": self.sender,
            "recipient": self.recipient,
            "amount": self.amount,
            "timestamp": self.timestamp
        }


# =========================
# 区块数据结构
# =========================
@dataclass
class Block:
    index: int
    timestamp: float
    transactions: List[dict]
    previous_hash: str
    nonce: int
    difficulty: int
    merkle_root: str
    hash: str = ""

    def to_dict(self, include_hash=True):
        data = {
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
            "difficulty": self.difficulty,
            "merkle_root": self.merkle_root
        }
        if include_hash:
            data["hash"] = self.hash
        return data


# =========================
# 区块链主类
# =========================
class Blockchain:
    def __init__(self, difficulty=4, mining_reward=10):
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        self.difficulty = difficulty
        self.mining_reward = mining_reward

        # 创建初始区块
        genesis_block = self.create_genesis_block()
        self.chain.append(genesis_block)

    # 创建初始区块
    def create_genesis_block(self) -> Block:
        transactions = []
        merkle_root = self.calculate_merkle_root(transactions)
        block = Block(
            index=0,
            timestamp=time.time(),
            transactions=transactions,
            previous_hash="0" * 64,
            nonce=0,
            difficulty=self.difficulty,
            merkle_root=merkle_root
        )
        block.hash = self.calculate_block_hash(block)
        return block

    # 获取最新区块
    def get_latest_block(self) -> Block:
        return self.chain[-1]

    # 计算 SHA-256 哈希
    def sha256(self, data: str) -> str:
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    # 计算交易哈希
    def calculate_transaction_hash(self, tx: dict) -> str:
        tx_string = json.dumps(tx, sort_keys=True, ensure_ascii=False)
        return self.sha256(tx_string)

    # 计算默克尔根
    def calculate_merkle_root(self, transactions: List[dict]) -> str:
        if not transactions:
            return self.sha256("空交易列表")

        hashes = [self.calculate_transaction_hash(tx) for tx in transactions]

        while len(hashes) > 1:
            if len(hashes) % 2 == 1:
                hashes.append(hashes[-1])

            new_hashes = []
            for i in range(0, len(hashes), 2):
                combined = hashes[i] + hashes[i + 1]
                new_hashes.append(self.sha256(combined))
            hashes = new_hashes

        return hashes[0]

    # 计算区块哈希
    def calculate_block_hash(self, block: Block) -> str:
        block_data = {
            "index": block.index,
            "timestamp": block.timestamp,
            "transactions": block.transactions,
            "previous_hash": block.previous_hash,
            "nonce": block.nonce,
            "difficulty": block.difficulty,
            "merkle_root": block.merkle_root
        }
        block_string = json.dumps(block_data, sort_keys=True, ensure_ascii=False)
        return self.sha256(block_string)

    # 添加待处理交易
    def add_transaction(self, sender: str, recipient: str, amount: float) -> bool:
        if not sender or not recipient:
            print("发送方和接收方不能为空。")
            return False

        if amount <= 0:
            print("交易金额必须大于 0。")
            return False

        # 简单规则：
        # SYSTEM 代表系统账户，可用于挖矿奖励
        if sender != "SYSTEM":
            balance = self.get_balance(sender)
            pending_out = sum(
                tx.amount for tx in self.pending_transactions if tx.sender == sender
            )
            if balance - pending_out < amount:
                print("余额不足，交易无法加入。")
                return False

        tx = Transaction(
            sender=sender,
            recipient=recipient,
            amount=amount,
            timestamp=time.time()
        )
        self.pending_transactions.append(tx)
        return True

    # 工作量证明挖矿
    def proof_of_work(self, block: Block) -> str:
        target = "0" * block.difficulty

        while True:
            block_hash = self.calculate_block_hash(block)
            if block_hash.startswith(target):
                return block_hash
            block.nonce += 1

    # 挖矿：把待处理交易打包进新区块
    def mine_pending_transactions(self, miner_address: str) -> Optional[Block]:
        if not miner_address:
            print
            return None

        # 挖矿奖励交易
        reward_tx = Transaction(
            sender="SYSTEM",
            recipient=miner_address,
            amount=self.mining_reward,
            timestamp=time.time()
        )

        tx_dicts = [tx.to_dict() for tx in self.pending_transactions]
        tx_dicts.append(reward_tx.to_dict())

        new_block = Block(
            index=len(self.chain),
            timestamp=time.time(),
            transactions=tx_dicts,
            previous_hash=self.get_latest_block().hash,
            nonce=0,
            difficulty=self.difficulty,
            merkle_root=self.calculate_merkle_root(tx_dicts)
        )

        print("开始挖矿，请稍候...")
        mined_hash = self.proof_of_work(new_block)
        new_block.hash = mined_hash

        self.chain.append(new_block)
        self.pending_transactions = []

        print(f"挖矿成功！新区块哈希：{new_block.hash}")
        return new_block

    # 查询地址余额
    def get_balance(self, address: str) -> float:
        balance = 0.0

        for block in self.chain:
            for tx in block.transactions:
                if tx["sender"] == address:
                    balance -= tx["amount"]
                if tx["recipient"] == address:
                    balance += tx["amount"]

        return balance

    # 校验整条链是否合法
    def is_chain_valid(self) -> bool:
        if len(self.chain) == 0:
            return False

        # 检查初始区块
        genesis = self.chain[0]
        recalculated_genesis_hash = self.calculate_block_hash(genesis)
        if genesis.hash != recalculated_genesis_hash:
            print("创世区块哈希不合法。")
            return False

        # 检查后续区块
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            # 1. 检查 previous_hash
            if current_block.previous_hash != previous_block.hash:
                print(f"第 {i} 个区块的 previous_hash 错误。")
                return False

            # 2. 检查默克尔根
            recalculated_merkle = self.calculate_merkle_root(current_block.transactions)
            if current_block.merkle_root != recalculated_merkle:
                print(f"第 {i} 个区块的默克尔根错误。")
                return False

            # 3. 检查区块哈希是否正确
            recalculated_hash = self.calculate_block_hash(current_block)
            if current_block.hash != recalculated_hash:
                print(f"第 {i} 个区块的哈希被篡改。")
                return False

            # 4. 检查是否满足难度要求
            if not current_block.hash.startswith("0" * current_block.difficulty):
                print(f"第 {i} 个区块未满足挖矿难度要求。")
                return False

        return True

    # 打印整条链
    def print_chain(self):
        print("\n========== 当前区块链 ==========")
        for block in self.chain:
            print(json.dumps(block.to_dict(), indent=2, ensure_ascii=False))
        print("================================\n")

    # 打印待处理交易
    def print_pending_transactions(self):
        print("\n====== 待处理交易池 ======")
        if not self.pending_transactions:
            print("当前没有待处理交易。")
        else:
            for i, tx in enumerate(self.pending_transactions, start=1):
                print(f"{i}. {tx.sender} -> {tx.recipient} : {tx.amount}")
        print("==========================\n")


# =========================
# 命令行菜单
# =========================
def menu():
    print("============ 区块链教学系统 ============")
    print("1. 添加交易")
    print("2. 挖矿")
    print("3. 查询余额")
    print("4. 查看区块链")
    print("5. 查看待处理交易")
    print("6. 校验区块链")
    print("0. 退出")
    print("=======================================")


def main():
    blockchain = Blockchain(difficulty=4, mining_reward=10)

    # 给系统演示用账户先挖一个块，产生初始奖励
    blockchain.mine_pending_transactions("Carro")

    while True:
        menu()
        choice = input("请输入功能编号：").strip()

        if choice == "1":
            sender = input("发送方地址：").strip()
            recipient = input("接收方地址：").strip()

            try:
                amount = float(input("交易金额：").strip())
            except ValueError:
                print("金额格式错误，请输入数字。")
                continue

            ok = blockchain.add_transaction(sender, recipient, amount)
            if ok:
                print("交易已加入待处理交易池。")

        elif choice == "2":
            miner = input("请输入矿工地址：").strip()
            blockchain.mine_pending_transactions(miner)

        elif choice == "3":
            address = input("请输入要查询的地址：").strip()
            balance = blockchain.get_balance(address)
            print(f"{address} 的余额为：{balance}")

        elif choice == "4":
            blockchain.print_chain()

        elif choice == "5":
            blockchain.print_pending_transactions()

        elif choice == "6":
            valid = blockchain.is_chain_valid()
            if valid:
                print("区块链校验通过，链是有效的。")
            else:
                print("区块链校验失败，链可能被篡改。")

        elif choice == "0":
            print("程序结束。")
            break

        else:
            print("无效输入，请重新选择。")


if __name__ == "__main__":
    main()
