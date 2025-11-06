{/* Statistics Cards */}
<div className="flex flex-col md:flex-row gap-6 mb-8">
  {/* Money In Card */}
  <div className="flex-1 bg-white border-2 border-[#E0E9F6] rounded-lg p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-green-100 p-3 rounded-full">
        <TrendingUp className="h-6 w-6 text-green-600" />
      </div>
      <span className="text-sm text-[#3E68A3] font-semibold">This Month</span>
    </div>
    <h3 className="text-gray-600 text-sm mb-1">Money In</h3>
    <p className="text-2xl font-bold text-[#04080F]">{formatCurrency(dashboardData.moneyIn)}</p>
  </div>

  {/* Money Out Card */}
  <div className="flex-1 bg-white border-2 border-[#E0E9F6] rounded-lg p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-red-100 p-3 rounded-full">
        <TrendingDown className="h-6 w-6 text-red-600" />
      </div>
      <span className="text-sm text-[#3E68A3] font-semibold">This Month</span>
    </div>
    <h3 className="text-gray-600 text-sm mb-1">Money Out</h3>
    <p className="text-2xl font-bold text-[#04080F]">{formatCurrency(dashboardData.moneyOut)}</p>
  </div>

  {/* Current Balance Card */}
  <div className="flex-1 bg-[#A1C6EA] rounded-lg p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-white p-3 rounded-full">
        <Wallet className="h-6 w-6 text-[#3E68A3]" />
      </div>
      <span className="text-sm text-[#04080F] font-semibold">Available</span>
    </div>
    <h3 className="text-[#04080F] text-sm mb-1">Current Balance</h3>
    <p className="text-2xl font-bold text-white">{formatCurrency(dashboardData.currentBalance)}</p>
  </div>
</div>

{/* Financial Status Indicator */}
<div className={`${statusConfig.bgColor} border-2 ${statusConfig.borderColor} rounded-lg p-6 mb-8`}>
  <div className="flex items-center">
    <StatusIcon className={`h-8 w-8 ${statusConfig.color} mr-4`} />
    <div>
      <h3 className={`text-lg font-semibold ${statusConfig.color}`}>Financial Status</h3>
      <p className="text-gray-700">{statusConfig.text}</p>
    </div>
  </div>
</div>

{/* Recent Transactions */}
<div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-bold text-[#04080F]">Recent Transactions</h2>
    <button className="text-[#3E68A3] hover:text-[#A1C6EA] font-semibold text-sm transition">
      View All
    </button>
  </div>
  
  <div className="space-y-4">
    {dashboardData.recentTransactions.map((transaction) => (
      <div key={transaction.id} className="flex items-center justify-between p-4 bg-[#E0E9F6] rounded-lg hover:bg-[#A1C6EA] transition-colors">
        <div className="flex-1">
          <p className="font-semibold text-[#04080F]">{transaction.description}</p>
          <p className="text-sm text-[#3E68A3]">{transaction.category} • {transaction.date}</p>
        </div>
        <div className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
        </div>
      </div>
    ))}
  </div>
</div>

export default Home;
