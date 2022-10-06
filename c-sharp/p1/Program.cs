using System.Net;

class TextingApp {
    public static void StartListener(string[] prefixes){
        HttpListener listener = new HttpListener();
        foreach (string s in prefixes)
        {
            listener.Prefixes.Add(s);
        }
        listener.Start();
        Console.WriteLine("Listening...");

        HttpListenerContext context = listener.GetContext();

        HttpListenerRequest request = context.Request;

        HttpListenerResponse response = context.Response;

        string responseString = "<HTML><BODY> Hello world!</BODY></HTML>";
        byte[] buffer = System.Text.Encoding.UTF8.GetBytes(responseString);
        Console.WriteLine(request.RawUrl);
        response.ContentLength64 = buffer.Length;
        response.OutputStream.Write(buffer,0,buffer.Length);

        response.OutputStream.Close();
        listener.Stop();
    }
    static void Main(){
        string[] p = {"http://localhost:3123/"};
        StartListener(p);
    }
}
