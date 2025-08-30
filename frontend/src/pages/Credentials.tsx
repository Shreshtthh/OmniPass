import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, ExternalLink, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalysisContext } from '@/contexts/AnalysisContext'; // ✅ Use context

export default function Credentials() {
  const { analysis, showResults, txHash } = useAnalysisContext(); // ✅ Get from context

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Credentials
          </h1>
          <p className="text-muted-foreground text-lg">
            View and manage your OmniPass credentials
          </p>
        </div>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Your OmniPass Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {showResults && analysis ? (
              // ✅ Show analysis data when available
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 glass rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{analysis.accessLevel.tier} Tier Credential</h3>
                      <p className="text-muted-foreground">Portfolio Value: ${analysis.totalValueLocked.toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    <Zap className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                {txHash && (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm text-accent font-medium">Credential issued on ZetaChain</p>
                    <p className="text-xs text-muted-foreground mt-1">TX: {txHash}</p>
                  </div>
                )}
              </div>
            ) : (
              // ✅ Show empty state when no analysis
              <div className="text-center py-12">
                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Credentials Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Complete your portfolio analysis to see your credentials
                </p>
                <Button asChild className="btn-gradient">
                  <Link to="/">
                    Analyze Portfolio
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
